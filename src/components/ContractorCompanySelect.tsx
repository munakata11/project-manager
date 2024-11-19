import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ContractorCompanySelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ContractorCompanySelect({ value, onChange }: ContractorCompanySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const { toast } = useToast();

  const { data: companies, refetch } = useQuery({
    queryKey: ["contractor-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contractor_companies")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) return;

    const { error } = await supabase
      .from("contractor_companies")
      .insert({ name: newCompanyName.trim() });

    if (error) {
      toast({
        title: "エラー",
        description: "会社の追加に失敗しました。",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "成功",
      description: "会社を追加しました。",
    });
    setNewCompanyName("");
    setIsOpen(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("この会社を削除してもよろしいですか？")) return;

    const { error } = await supabase
      .from("contractor_companies")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "エラー",
        description: "会社の削除に失敗しました。",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "成功",
      description: "会社を削除しました。",
    });
    
    if (value === id) {
      onChange("");
    }
    refetch();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="受注会社を選択" />
          </SelectTrigger>
          <SelectContent>
            {companies?.map((company) => (
              <div key={company.id} className="flex items-center justify-between px-2 py-1.5">
                <SelectItem value={company.id}>
                  {company.name}
                </SelectItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(company.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規会社追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="会社名"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                />
              </div>
              <Button onClick={handleAddCompany} className="w-full">
                追加
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}