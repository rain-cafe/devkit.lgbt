import { ButtonIcon } from '@/components/ButtonIcon';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageContent } from '@/components/PageContent';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBetterLoaderData } from '@/hooks/use-loader-data';
import { Storage, StorageKeys } from '@/storage';
import { IStorage } from '@/storage/base';
import { Download, Flame, Import } from 'lucide-react';
import { useState } from 'react';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('json', json);

const KEY_TO_LABEL: Record<StorageKeys, string> = {
  [StorageKeys.LISTS]: 'Todo Lists',
  [StorageKeys.NOTES]: 'Notes',
  [StorageKeys.SETTINGS]: 'Settings',
};

export async function loader(): Promise<IStorage.Data> {
  return await Storage.everything();
}

export function Component() {
  const noClipboardWrite = !navigator.clipboard || !navigator.clipboard.writeText;
  const noClipboardRead = !navigator.clipboard || !navigator.clipboard.readText;
  const [data, setData] = useBetterLoaderData<IStorage.Data>();
  const [dataKey, setDataKey] = useState(StorageKeys.LISTS);
  const [loading, setLoading] = useState(false);

  const onClear = async () => {
    setLoading(true);

    try {
      await Storage.clear();

      setData(await Storage.everything());
    } finally {
      setLoading(false);
    }
  };

  const onImport = async () => {
    setLoading(true);

    try {
      const text = await navigator.clipboard.readText();
      const data: IStorage.Data = Storage.convert(JSON.parse(atob(text)) as IStorage.Data.Raw);

      await Storage.load(data);
      setData(await Storage.everything());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader className="justify-between">
        <h1 className="text-2xl leading-none">Data</h1>
        <div className="flex gap-2">
          <ButtonIcon variant="outline" onClick={onImport} disabled={noClipboardRead || loading} icon={Import}>
            Import
          </ButtonIcon>
          <ButtonIcon
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(btoa(JSON.stringify(data)));
            }}
            disabled={noClipboardWrite || loading}
            icon={Download}
          >
            Export
          </ButtonIcon>
          <ConfirmDialog
            description="This action cannot be undone. This will permanently all of your data."
            onSubmit={onClear}
          >
            <ButtonIcon variant="destructive" icon={Flame} disabled={loading}>
              Clear
            </ButtonIcon>
          </ConfirmDialog>
        </div>
      </PageHeader>
      <PageContent className="gap-0">
        <Tabs
          value={dataKey}
          onValueChange={(tab) => {
            setDataKey(tab as StorageKeys);
          }}
        >
          <TabsList className="border-b border-b-black/50 grid w-full grid-flow-col-dense rounded-b-none">
            {Object.values(StorageKeys).map((key) => (
              <TabsTrigger key={key} value={key}>
                {KEY_TO_LABEL[key]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <SyntaxHighlighter
          language="json"
          style={a11yDark}
          customStyle={{
            background: 'hsl(var(--muted))',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            marginTop: 0,
          }}
        >
          {JSON.stringify(data[dataKey], null, 4)}
        </SyntaxHighlighter>
      </PageContent>
    </>
  );
}

Component.displayName = 'DataPage';
