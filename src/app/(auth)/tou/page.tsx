import { TermsOfUseMd } from "@/components/app/legal/terms-of-use-md";
import { Card, CardContent } from "@/components/ui/card";

const TermsOfUsePage = () => {
  return (
    <Card className="container mx-auto py-8">
      <CardContent className="mx-auto max-w-4xl">
        <TermsOfUseMd />
      </CardContent>
    </Card>
  );
};

export default TermsOfUsePage;
