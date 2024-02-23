import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ListItem } from '@/components/ListItem';
import { ListItems } from '@/components/ListItems';
import { PageContent } from '@/components/PageContent';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Storage, StorageKeys, Todo } from '@/storage';
import { useCachedState } from '@rain-cafe/react-utils';
import { Flame } from 'lucide-react';
import { useMemo } from 'react';
import { Link, LoaderFunctionArgs, Navigate, redirect, useLoaderData } from 'react-router-dom';

export function TodoListPage() {
  const externalList = useLoaderData() as Todo.List;
  const [list, setList] = useCachedState<Todo.List>(() => externalList, [externalList]);
  const allDone = useMemo(() => {
    return Boolean(list?.items.length) && list?.items.every((item) => item.done);
  }, [list?.items]);

  const onChange = async (updatedList: Todo.List) => {
    setList(updatedList);
    await Storage.set(StorageKeys.LISTS, updatedList);
  };

  if (!list) return <Navigate to="/todo" />;

  return (
    <>
      <PageHeader className="text-2xl">
        <Link className="hover:underline" to="/todo">
          Todo
        </Link>
        <div>&gt;</div>
        <div className="truncate">{list.label}</div>
      </PageHeader>
      <PageContent>
        <div className="flex items-center gap-4">
          <Checkbox
            className="shrink-0"
            checked={allDone}
            disabled={list.items.length === 0}
            onClick={() => {
              onChange({
                ...list,
                items: list.items.map((item) => ({
                  ...item,
                  done: !allDone,
                })),
              });
            }}
          />
          <Input
            value={list.label}
            onChange={(e) =>
              onChange({
                ...list,
                label: e.target.value,
              })
            }
          />
          <ConfirmDialog
            description="This action cannot be undone. This will permanently delete this list."
            onSubmit={async () => {
              setList(undefined);
              await Storage.delete(StorageKeys.LISTS, list.id);
            }}
          >
            <Button className="shrink-0" variant="destructive" size="icon">
              <Flame />
            </Button>
          </ConfirmDialog>
        </div>
        <Separator />
        <ListItem
          placeholder="Add a new item..."
          onChange={(item) => {
            onChange({
              ...list,
              items: [item, ...list.items],
            });
          }}
          blank
        />
        <ListItems
          items={list.items}
          onChange={(updatedItems) => {
            onChange({
              ...list,
              items: updatedItems,
            });
          }}
        />
      </PageContent>
    </>
  );
}

export namespace TodoListPage {
  export async function loader({ params }: LoaderFunctionArgs<any>) {
    if (!params.id) return redirect('/');

    const list = await Storage.get(StorageKeys.LISTS, params.id);

    if (!list) return redirect('/todo');

    return list;
  }
}
