"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useConfigureAPIKey } from "@/hooks/userAPIs/POST/useConfigureAPIKey";
import { Spinner } from "../ui/spinner";
import { auth } from "@/config/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

interface configureAPIKeyModalProps {
  provider: string;
}

const ConfigureAPIKeyModal = ({ provider }: configureAPIKeyModalProps) => {
  const [user] = useAuthState(auth);
  const { mutate, isPending, isError } = useConfigureAPIKey();

  const formSchema = z.object({
    key: z
      .string()
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const data = {
      uid: user?.uid as string,
      key: values.key,
      provider: "openAI",
    };

    mutate(data);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: "Sk-hdfb78gy",
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="">
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add OpenAI API key</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">API Key</FormLabel>
                  <FormControl>
                    <Input
                      className="text-[13px]"
                      placeholder="Sk-hdfb78gy"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="py-2 flex">
              <Button
                type="submit"
                size="sm"
                className="w-full"
                variant="default"
              >
                {isPending ? <Spinner /> : <span>Submit</span>}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigureAPIKeyModal;