import { getUser } from "@/lib/actions/user/actions";
import ProfileForm from "@/components/user/profile-form";
import PasswordForm from "@/components/user/password-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function ProfilePage() {
  const USER = await getUser();
  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-[#f5f5f7] dark:bg-background">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-xl text-muted-foreground">Manage your profile and security preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold">Personal Information</h2>
            <p className="text-sm text-muted-foreground mt-1">Update your name and contact details.</p>
          </div>
          <div className="md:col-span-2">
            <Card className="rounded-[2rem] border-none shadow-none bg-white dark:bg-secondary/30 p-4">
              <CardContent className="pt-6">
                <ProfileForm userData={USER.data} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="border-t pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold">Security</h2>
            <p className="text-sm text-muted-foreground mt-1">Keep your account secure with a strong password.</p>
          </div>
          <div className="md:col-span-2 space-y-6">
            <Card className="rounded-[2rem] border-none shadow-none bg-white dark:bg-secondary/30 p-4">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Email Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{USER.data?.email}</p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-none bg-white dark:bg-secondary/30 p-4">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
