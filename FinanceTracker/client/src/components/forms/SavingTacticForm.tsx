import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSavingTacticSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SavingTactic } from "@shared/schema";

// Use the full schema including isPersonal
const savingTacticFormSchema = insertSavingTacticSchema;

type SavingTacticFormData = z.infer<typeof savingTacticFormSchema>;

interface SavingTacticFormProps {
  tactic?: SavingTactic;
  onSubmit: (data: SavingTacticFormData) => void;
  onCancel: () => void;
}

const categories = [
  { value: "budgeting", label: "Budgeting" },
  { value: "automation", label: "Automation" },
  { value: "mindset", label: "Mindset" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "investment", label: "Investment" },
  { value: "emergency", label: "Emergency" },
  { value: "custom", label: "Custom" },
];

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function SavingTacticForm({ tactic, onSubmit, onCancel }: SavingTacticFormProps) {
  const form = useForm<SavingTacticFormData>({
    resolver: zodResolver(savingTacticFormSchema),
    defaultValues: {
      title: tactic?.title || "",
      description: tactic?.description || "",
      category: tactic?.category || "custom",
      difficulty: tactic?.difficulty || "easy",
      estimatedSavings: tactic?.estimatedSavings || "",
      timeToImplement: tactic?.timeToImplement || "",
      tags: tactic?.tags || "",
      isPersonal: tactic?.isPersonal ?? true,
      isActive: tactic?.isActive ?? true,
    },
  });

  const handleSubmit = (data: SavingTacticFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., 52-Week Savings Challenge" 
                  {...field} 
                />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your saving tactic in detail..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimatedSavings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Savings (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., $50/month, 10% of income" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeToImplement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time to Implement (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., 1 hour, 1 week, ongoing" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder='JSON format: ["tag1", "tag2", "tag3"]' 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isPersonal"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Personal Tactic</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Mark this as a personal tactic (vs. expert recommendation)
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Show this tactic to users
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {tactic ? "Update Tactic" : "Create Tactic"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 