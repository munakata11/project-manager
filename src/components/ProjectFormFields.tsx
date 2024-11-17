import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ContractorCompanySelect } from "./ContractorCompanySelect";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  title: z.string().min(1, "プロジェクト名は必須です"),
  description: z.string().optional(),
  design_period: z.date({
    required_error: "設計工期は必須です",
  }),
  amount_excl_tax: z.number().min(0, "0以上の数値を入力してください"),
  amount_incl_tax: z.number().min(0, "0以上の数値を入力してください"),
  contractor_company_id: z.string().min(1, "受注会社は必須です"),
});

type FormData = z.infer<typeof formSchema>;

interface ProjectFormFieldsProps {
  form: UseFormReturn<FormData>;
}

export function ProjectFormFields({ form }: ProjectFormFieldsProps) {
  const handleAmountExclTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 空文字列の場合は0として扱う
    const numValue = value === "" ? 0 : parseFloat(value);
    form.setValue("amount_excl_tax", numValue);
    // Calculate tax-inclusive amount (10% tax)
    form.setValue("amount_incl_tax", Math.round(numValue * 1.1));
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>プロジェクト名</FormLabel>
            <FormControl>
              <Input placeholder="プロジェクト名を入力" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>説明</FormLabel>
            <FormControl>
              <Textarea placeholder="プロジェクトの説明を入力" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contractor_company_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>受注会社</FormLabel>
            <FormControl>
              <ContractorCompanySelect
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="design_period"
        render={({ field }) => (
          <FormItem>
            <FormLabel>設計工期</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "yyyy年MM月dd日")
                    ) : (
                      <span>日付を選択</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="amount_excl_tax"
        render={({ field }) => (
          <FormItem>
            <FormLabel>受注金額（税抜）</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="0"
                value={field.value}
                onChange={handleAmountExclTaxChange}
                min="0"
                step="1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="amount_incl_tax"
        render={({ field }) => (
          <FormItem>
            <FormLabel>受注金額（税込）</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="0"
                value={field.value}
                disabled
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export { formSchema };
export type { FormData };