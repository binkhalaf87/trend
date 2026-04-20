import { Metadata } from "next";
import { ContentGenerator } from "@/components/content/content-generator";
import { ContentHistory } from "@/components/content/content-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "المحتوى الجاهز" };

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">المحتوى الجاهز</h1>
        <p className="text-muted-foreground mt-1">
          ولّد محتوى عربياً احترافياً مستوحى من الترندات الصاعدة.
        </p>
      </div>

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">توليد محتوى جديد</TabsTrigger>
          <TabsTrigger value="history">المحتوى السابق</TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="mt-4">
          <ContentGenerator />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <ContentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
