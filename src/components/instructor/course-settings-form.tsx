"use client";

import { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateCourseAction } from "@/server/actions/courses";
import { useToast } from "@/components/providers/toast-provider";

type CourseSettings = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  price: string;
  discountPrice: string;
  thumbnailUrl: string;
  promoVideoUrl: string;
};

export function CourseSettingsForm({ course }: { course: CourseSettings }) {
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateCourseAction(course.id, formData);
        push("Course settings saved", "success");
      } catch {
        push("Failed to save settings", "error");
      }
    });
  }

  return (
    <Card>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={course.title} required />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" name="subtitle" defaultValue={course.subtitle} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={4} defaultValue={course.description} />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" defaultValue={course.category} />
          </div>
          <div>
            <Label htmlFor="level">Level</Label>
            <Select id="level" name="level" defaultValue={course.level}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={course.price} />
            </div>
            <div>
              <Label htmlFor="discountPrice">Discount</Label>
              <Input id="discountPrice" name="discountPrice" type="number" min="0" step="0.01" defaultValue={course.discountPrice} />
            </div>
          </div>
          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input id="thumbnailUrl" name="thumbnailUrl" defaultValue={course.thumbnailUrl} />
          </div>
          <div>
            <Label htmlFor="promoVideoUrl">Promo video URL</Label>
            <Input id="promoVideoUrl" name="promoVideoUrl" defaultValue={course.promoVideoUrl} />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
