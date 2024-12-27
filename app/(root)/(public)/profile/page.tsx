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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Your Profile
        </h1>

        {/* Profile Information Card */}
        <Card className="bg-white dark:bg-background/40 border sm:rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
              Profile Information
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
              Update your profile details here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-5">
              {/* <ImageUploadForm initialImageUrl={userData.profileImageUrl} /> */}
            </div>
            <div className="mt-5">
              <ProfileForm userData={USER.data} />
            </div>
          </CardContent>
        </Card>

        {/* Email Address Card */}
        <Card className="bg-white dark:bg-background/40 border sm:rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
              Email Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {USER.data?.email}
            </p>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="bg-white dark:bg-background/40 border sm:rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-5">
              <PasswordForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
