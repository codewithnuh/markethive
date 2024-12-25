import { getUserData } from "@/lib/actions/user/actions";
import ProfileForm from "@/components/user/profile-form";
import PasswordForm from "@/components/user/password-form";
import ImageUploadForm from "@/components/user/image-upload";
export default async function ProfilePage() {
  const userData = await getUserData();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Your Profile
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow-md sm:rounded-lg ">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Profile Information
            </h2>
            <div className="mt-5">
              <ImageUploadForm initialImageUrl={userData.profileImageUrl} />
            </div>
            <div className="mt-5">
              <ProfileForm initialData={userData} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Email Address
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {userData.email}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Change Password
            </h2>
            <div className="mt-5">
              <PasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
