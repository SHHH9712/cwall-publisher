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
import { Settings } from "lucide-react";

const formSchema = z.object({
  igUserId: z.string(),
  googleFolderId: z.string(),
  longLiveFBAccessToken: z.string(),
});

export default function SettingPage() {
  const [igUserId, setigUserId] = useState<string>("");
  const [googleFolderId, setGoogleFolderId] = useState<string>("");
  const [longLiveFBAccessToken, setlongLiveFBAccessToken] =
    useState<string>("");
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      igUserId: igUserId,
      googleFolderId: googleFolderId,
      longLiveFBAccessToken: longLiveFBAccessToken,
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

  useEffect(() => {
    const getSettings = async () => {
      try {
        const response = await axios.get("/api/settings");
        setigUserId(response.data.igUserId);
        setGoogleFolderId(response.data.googleFolderId);
        setlongLiveFBAccessToken(response.data.longLiveFBAccessToken);

        form.setValue("igUserId", response.data.igUserId);
        form.setValue("googleFolderId", response.data.googleFolderId);
        form.setValue(
          "longLiveFBAccessToken",
          response.data.longLiveFBAccessToken
        );
      } catch (e) {
        console.log(e);
        toast({
          title: "Error",
          description: "Error getting settings",
          variant: "destructive",
        });
      }
    };
    getSettings();
  }, [toast, form]);

  return (
    <div className="flex h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col gap-5">
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
                      Your Facebook dev account public page user id:
                      <a
                        className="underline ml-1"
                        href="https://developers.facebook.com/docs/instagram-api/getting-started#:~:text=Page%20for%20you).-,5.%20Get%20the%20Page%27s%20Instagram%20Business%20Account,-Use%20the%20Page"
                      >
                        guide
                      </a>
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
                      Your Google Drive folder id:
                      <a
                        className="underline ml-1"
                        href="https://learn.azuqua.com/connector-reference/googledrive/#:~:text=Navigate%20to%20the%20folder%20in,ID%20would%20be%20%E2%80%9C1dyUEebJaFnWa3Z4n0BFMVAXQ7mfUH11g%E2%80%9D."
                      >
                        guide
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longLiveFBAccessToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>longLiveFBAccessToken</FormLabel>
                    <FormControl>
                      <Input placeholder={longLiveFBAccessToken} {...field} />
                    </FormControl>
                    <FormDescription>
                      Your long live Facebook access token, how to get it:
                      <a
                        className="underline ml-1"
                        href="https://www.sociablekit.com/get-facebook-long-lived-user-access-token/#:~:text=As%20you%20will%20see%20in,%2Dlived%20user%20access%20token%E2%80%9D."
                      >
                        guide
                      </a>
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
