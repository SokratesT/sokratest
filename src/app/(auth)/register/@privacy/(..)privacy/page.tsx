import { InterceptingModal } from "@/components/app/intercepting-modal";
import { PrivacyPolicyMd } from "@/components/app/legal/privacy-policy-md";

const PrivacyPolicyModal = () => {
  return (
    <InterceptingModal title="Privacy Policy" className="">
      <PrivacyPolicyMd />
    </InterceptingModal>
  );
};

export default PrivacyPolicyModal;
