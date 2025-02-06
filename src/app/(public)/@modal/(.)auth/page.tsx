import { InterceptingModal } from "@/app/app/posts/@modal/(.)edit/[id]/_components/intercepting-modal";
import { Auth } from "@/components/auth";

const AuthPage = async () => {
  return (
    <InterceptingModal title="Authentication">
      <Auth />
    </InterceptingModal>
  );
};

export default AuthPage;
