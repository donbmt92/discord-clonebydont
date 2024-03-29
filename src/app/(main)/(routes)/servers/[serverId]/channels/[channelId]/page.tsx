import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface ChannelIdPageProps {
  params: {
    serverId: string;
    channelId: string;
  };
}

const ChannelidPage = async ({ params }: ChannelIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const channel = await db.channel.findUnique({
    where: {
      id: params.channelId,
    },
  });

  const member = await db.member.findFirst({
    where: {
      serverId: params.serverId,
      profileId: profile.id,
    },
  });

  if (!channel || !member) {
    redirect("/");
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      <ChatMessages
        name={channel.name}
        member={member}
        type="channel"
        apiUrl="/api/messages"
        chatId={channel.id}
        socketUrl="/api/socket/messages"
        paramKey="channelId"
        paramValue={channel.id}
        socketQuery={{
          channelId: channel.id,
          serverId: channel.serverId,
        }}
       
      />
      <ChatInput
        apiUrl="/api/socket/messages"
        name={channel.name}
        type="channel"
        query={{ channelId: channel.id, serverId: channel.serverId }}
      />
    </div>
  );
};
export default ChannelidPage;
