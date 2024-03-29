/**
 * This function handles POST requests to create a new message in a chat application, ensuring the user
 * is authorized and the necessary data is provided before saving the message to the database and
 * emitting it to the appropriate channel.
 * @param {NextApiRequest} req - The `req` parameter in the code snippet represents the Next.js API
 * request object, which contains information about the incoming HTTP request such as headers, query
 * parameters, and body content. It is of type `NextApiRequest` imported from the "next" package.
 * @param {NextApiResponseServerIo} res - The `res` parameter in the code snippet represents the
 * response object that will be sent back to the client making the request. It is of type
 * `NextApiResponseServerIo`, which is specific to the Next.js framework and likely extends the
 * standard `NextApiResponse` type to include additional functionality related to server
 * @returns The code snippet is an API route handler function that handles POST requests to create a
 * new message in a chat application. The function first checks if the request method is POST, and if
 * not, it returns a 405 status with an error message.
 */
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "../../../../../types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  /* The `if (req.method !== "POST")` block in the code snippet is checking if the HTTP request method
  is not a POST method. If the request method is not POST, it means that the client is trying to
  perform an operation that is not allowed for this specific endpoint. In this case, the code
  returns a 405 status code with an error message indicating that the method is not allowed for this
  endpoint. This is a common practice to enforce specific HTTP methods for different API endpoints
  to ensure proper usage and security. */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    /* This code snippet is a function that handles POST requests to create a new message in a chat
    application. Here's a breakdown of what the code is doing: */
    const profile = await currentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;

    if (!profile) return res.status(404).json({ error: `Unauthorized` });
    if (!serverId) return res.status(400).json({ error: `Server Missing` });
    if (!channelId) return res.status(400).json({ error: `Channel Missing` });
    if (!content) return res.status(400).json({ error: `Content Missing` });

    /* The code snippet `const server = await db.server.findFirst({ ... });` is querying the database
    to find the first server that meets the specified conditions. Here's a breakdown of what it's
    doing: */

    /* It uses the db.server.findFirst function to find the first server that meets the specified conditions.
    The conditions for finding the server are specified using the where parameter. It looks for a server where:
    The id matches the serverId (assuming serverId is a variable or parameter of type string).
    The members array contains at least one element where the profileId matches profile.id.
    The include parameter is used to specify that you want to include the members associated with the server in the result.*/


    /*where: Specifies the conditions for finding the server. It's an object with properties representing the fields to filter on.
    include: Specifies which related models should be included in the result. In this case, it includes the members associated with the server.
    The await keyword is used because db.server.findFirst returns a promise, indicating that it's an asynchronous operation. This means that the code will wait for the promise to resolve before continuing execution. */
    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) return res.status(404).json({ messages: "Server Not Found" });

    /* The code snippet `const channel = await db.channel.findFirst({ ... });` is querying the database
    to find the first channel that meets the specified conditions. Here's a breakdown of what it's
    doing: */
    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });
    if (!channel)
      return res.status(404).json({ messages: "Channel Not Found" });

    const members = await server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!members) return res.status(404).json({ messages: "Member Not Found" });

    /* The code snippet `const message = await db.message.create({ ... });` is creating a new message
    in the chat application. Here's a breakdown of what it's doing: */
    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: channelId as string,
        memberId: members.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${channelId}:messages`;
    res?.socket?.server?.io?.emit(channelKey, message);
    return res.status(200).json(message);
  } catch (error) {
    console.log("[MESSAGES_POST", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
