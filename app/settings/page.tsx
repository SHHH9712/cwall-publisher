"use client";

import { Navbar } from "@/components/navbar";
import { useToast } from "@/components/ui/use-toast";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  igUserId: z.string().min(0).max(50),
  googleFolderId: z.string().min(0).max(50),
});

export default function SettingPage() {
  const [igUserId, setigUserId] = useState<string>("");
  const [googleFolderId, setGoogleFolderId] = useState<string>("");
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      igUserId: igUserId,
      googleFolderId: googleFolderId,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axios.post("/api/settings", values);
      toast({
        title: "Success",
        description: "Settings saved",
        variant: "default",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Error saving settings",
        variant: "destructive",
      });
    }
  }

  const getSettings = async () => {
    try {
      const response = await axios.get("/api/settings");
      setigUserId(response.data.igUserId);
      setGoogleFolderId(response.data.googleFolderId);

      form.setValue("igUserId", response.data.igUserId);
      form.setValue("googleFolderId", response.data.googleFolderId);
    } catch (e) {
      console.log(e);
      toast({
        title: "Error",
        description: "Error getting settings",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    getSettings();
  }, []);

  return (
    <div className="">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-10 justify-between h-full">
            <div className="">
              <FormField
                control={form.control}
                name="igUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>igUserId</FormLabel>
                    <FormControl>
                      <Input placeholder={igUserId} {...field} />
                    </FormControl>
                    <FormDescription>
                      Your Facebook dev account public page user id
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="googleFolderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>googleFolderId</FormLabel>
                    <FormControl>
                      <Input placeholder={googleFolderId} {...field} />
                    </FormControl>
                    <FormDescription>
                      Your Google Drive folder id
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
