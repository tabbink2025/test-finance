import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

// Create a form-specific schema with string types for form fields
const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.string().min(1, "Type is required"),
  color: z.string().min(1, "Color is required"),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: z.infer<typeof insertCategorySchema>) => void;
  onCancel: () => void;
}

const categoryColors = [
  { value: "#DC2626", label: "Red" },
  { value: "#059669", label: "Green" },
  { value: "#2563EB", label: "Blue" },
  { value: "#7C3AED", label: "Purple" },
  { value: "#D97706", label: "Orange" },
  { value: "#0891B2", label: "Cyan" },
  { value: "#65A30D", label: "Lime" },
  { value: "#C2410C", label: "Orange Red" },
];

export default function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || "expense",
      color: category?.color || "#059669",
      parentId: category?.parentId?.toString() || "",
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit({
      name: data.name,
      type: data.type,
      color: data.color,
      parentId: data.parentId && data.parentId !== "none" ? Number(data.parentId) : null,
    });
  };

  const parentCategories = categories.filter(cat => !cat.parentId && cat.id !== category?.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Food & Dining" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {parentCategories.map((parentCategory) => (
                    <SelectItem key={parentCategory.id} value={parentCategory.id.toString()}>
                      {parentCategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {category ? "Update" : "Create"} Category
          </Button>
        </div>
      </form>
    </Form>
  );
}
