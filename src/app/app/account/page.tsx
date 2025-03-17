import { SendVerificationEmail } from "@/components/account/send-verification-email";
import { ProfileForm } from "@/components/forms/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

const AccountPage = async () => {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Email verification</CardTitle>
        </CardHeader>
        <CardContent>
          <SendVerificationEmail />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPage;
