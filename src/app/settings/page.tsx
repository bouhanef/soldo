import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesTab } from '@/components/settings/categories-tab';
import { SourcesTab } from '@/components/settings/sources-tab';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your categories and payment sources.</p>
      </div>

      <Tabs defaultValue="categories">
        <TabsList className="mb-6">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="sources">
          <SourcesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
