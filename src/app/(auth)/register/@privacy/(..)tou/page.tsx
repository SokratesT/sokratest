import { InterceptingModal } from "@/components/app/intercepting-modal";
import { TermsOfUseMd } from "@/components/app/legal/terms-of-use-md";

const PrivacyPolicyModal = () => {
  return (
    <InterceptingModal title="Terms of Use" className="">
      <TermsOfUseMd />
    </InterceptingModal>
  );
};

export default PrivacyPolicyModal;
