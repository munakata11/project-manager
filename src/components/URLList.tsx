import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

interface URLListProps {
  urls: {
    id: string;
    title: string;
    url: string;
    description: string | null;
    created_at: string;
    created_by: {
      full_name: string | null;
    } | null;
  }[];
  onRefetch: () => void;
}

export function URLList({ urls, onRefetch }: URLListProps) {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!window.confirm("このURLを削除してもよろしいですか？")) return;

    try {
      const { error } = await supabase
        .from("project_urls")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "URLを削除しました",
      });

      onRefetch();
    } catch (error) {
      toast({
        title: "エラー",
        description: "URLの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {urls?.map((url) => (
        <Card 
          key={url.id} 
          className="border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => window.open(url.url, "_blank")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{url.title}</h3>
                {url.description && (
                  <p className="mt-1 text-sm text-gray-500">{url.description}</p>
                )}
                <div className="mt-1 text-sm text-gray-500">
                  <span>
                    {new Date(url.created_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(url.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}