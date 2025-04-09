import { PrivacyPolicyMd } from "@/components/app/legal/privacy-policy-md";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicyPage = () => {
  return (
    <Card className="container mx-auto py-8">
      <CardContent className="mx-auto max-w-4xl">
        <PrivacyPolicyMd />
      </CardContent>
    </Card>
  );
};

export default PrivacyPolicyPage;
