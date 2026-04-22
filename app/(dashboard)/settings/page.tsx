import { Metadata } from "next";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { BillingSettings } from "@/components/settings/billing-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ApiSettings } from "@/components/settings/api-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "الإعدادات" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-1">
          إدارة حسابك واشتراكك وتفضيلاتك.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="billing">الاشتراك والفواتير</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="api">API والـ Webhook</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4 max-w-2xl">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="billing" className="mt-4">
          <BillingSettings />
        </TabsContent>
        <TabsContent value="notifications" className="mt-4 max-w-2xl">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="api" className="mt-4">
          <ApiSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
