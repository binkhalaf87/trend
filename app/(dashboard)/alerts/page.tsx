import { Metadata } from "next";
import { AlertsList } from "@/components/alerts/alerts-list";
import { AlertSettings } from "@/components/alerts/alert-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "التنبيهات" };

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">التنبيهات</h1>
        <p className="text-muted-foreground mt-1">
          تتبّع الترندات الجديدة وتلقَّ إشعارات فورية عند ارتفاع أي ترند في مجالك.
        </p>
      </div>

      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="settings">إعدادات التنبيهات</TabsTrigger>
        </TabsList>
        <TabsContent value="notifications" className="mt-4">
          <AlertsList />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <AlertSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
