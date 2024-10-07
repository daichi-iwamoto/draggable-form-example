import {
  useForm,
  useFieldArray,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Close from "@spectrum-icons/workflow/Close";
import DragHandle from "@spectrum-icons/workflow/DragHandle";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  GridList,
  GridListItem,
  Modal,
  ModalOverlay,
  Dialog,
  Heading,
  useDragAndDrop,
} from "react-aria-components";
import z from "zod";
import { useCallback, useEffect, useState } from "react";

const schema = z.object({
  favorites: z.array(
    z.object({
      name: z.string().min(1, "好きなものを入力してください"),
    })
  ),
});

type FieldValues = z.infer<typeof schema>;

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitData, setSubmitData] = useState<FieldValues | null>(null);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      favorites: [{ name: "" }],
    },
    resolver: zodResolver(schema),
  });
  const { fields, move, append, remove } = useFieldArray({
    control,
    name: "favorites",
  });

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((_, index) => ({ "text/plain": fields[index].id })),
    onReorder(e) {
      console.log(e);
      move(
        fields.findIndex((element) => element.id === Array.from(e.keys)[0]),
        fields.findIndex((element) => element.id === e.target.key)
      );
    },
  });

  const onSubmit = useCallback<SubmitHandler<FieldValues>>((values) => {
    setSubmitData(values);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    console.log(fields);
  }, [fields]);

  return (
    <div className="relative grid w-[100dvw] min-h-[100dvh] justify-center justify-items-center content-start p-5">
      <h1 className="text-gray-700">Draggable Form Example</h1>
      <p className="mt-4 text-gray-500">
        A demonstration using{" "}
        <span className="px-2 py-1 mx-1 rounded-md bg-gray-100 text-gray-500">
          react-hook-form
        </span>{" "}
        and{" "}
        <span className="px-2 py-1 mx-1 rounded-md bg-gray-100 text-gray-500">
          react-aria
        </span>{" "}
        for draggable form fields.
      </p>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <GridList
          aria-label="favorites list"
          className="w-[500px] grid gap-3 mt-16 mb-10"
          items={fields}
          dragAndDropHooks={dragAndDropHooks}
        >
          {(item) => (
            <GridListItem textValue={`_${item.id}`}>
              <Controller
                control={control}
                name={`favorites.${fields.findIndex(
                  (element) => element.id === item.id
                )}.name`}
                render={({
                  field: { name, value, onChange, ref },
                  fieldState: { invalid, error },
                }) => (
                  <TextField
                    className="p-2 border-[1px] border-gray-300 flex gap-[10px] place-items-center rounded-md relative bg-white"
                    name={name}
                    type="text"
                    isRequired
                    value={value}
                    onChange={onChange}
                    validationBehavior="aria"
                    isInvalid={invalid}
                  >
                    <Button
                      slot="drag"
                      className="w-[30px] h-[30px] p-1 overflow-hidden grid place-items-center bg-white text-gray-400"
                    >
                      <DragHandle aria-label="drag" />
                    </Button>
                    <div className="flex items-center flex-wrap w-full pr-[30px]">
                      <Label className="w-full text-left text-[10px] text-gray-400">
                        {fields.findIndex(
                          (element) => element.id === item.id
                        ) === 0
                          ? "1番"
                          : `${
                              fields.findIndex(
                                (element) => element.id === item.id
                              ) + 1
                            }番目に`}
                        好きなもの
                      </Label>
                      <Input
                        ref={ref}
                        className={`w-full p-1 mt-2 ${
                          typeof error !== "undefined" &&
                          "border-red-400 border-2 rounded-md"
                        }`}
                      />
                      <FieldError className="w-full text-red-400 text-[10px] text-left">
                        {error?.message}
                      </FieldError>
                    </div>
                    <Button
                      onPress={() =>
                        remove(
                          fields.findIndex((element) => element.id === item.id)
                        )
                      }
                      type="button"
                      className="absolute top-[5px] right-[5px] w-[20px] h-[20px] p-1 rounded-full overflow-hidden grid border-[1px] border-gray-300"
                    >
                      <Close aria-label="close" />
                    </Button>
                  </TextField>
                )}
              ></Controller>
            </GridListItem>
          )}
        </GridList>
        <div className="flex place-content-center gap-5">
          <Button
            type="button"
            onPress={() => {
              append({ name: "" });
            }}
          >
            append
          </Button>
          <Button className="bg-blue-400 text-white" type="submit">
            Submit
          </Button>
        </div>
      </Form>
      <ModalOverlay
        isOpen={isOpen}
        className="w-full h-full fixed top-0 left-0 bg-black/30 grid place-content-center"
      >
        <Modal
          className="p-5 bg-white rounded-md overflow-auto"
          isDismissable
          isKeyboardDismissDisabled
        >
          <Dialog>
            <Heading slot="title">Submited Value</Heading>
            <pre className="py-2 px-6 my-2 text-gray-600 bg-gray-100 rounded-sm max-h-[300px] text-[10px] overflow-auto">
              {JSON.stringify(submitData, null, 2)}
            </pre>
            <div className="text-right">
              <Button
                className="text-[12px] bg-blue-400 text-white rounded-sm"
                onPress={() => {
                  setIsOpen(false);
                  setSubmitData(null);
                }}
              >
                Close
              </Button>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}

export default App;
