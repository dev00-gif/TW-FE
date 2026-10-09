import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { bulletinContentText } from '../utils'

export function BulletinRichText({ content }: { content: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({ link: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: true }),
      Image,
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
    ],
    content,
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) {
    return (
      <p className="whitespace-pre-wrap text-sm leading-7">
        {bulletinContentText(content)}
      </p>
    )
  }

  return (
    <EditorContent
      editor={editor}
      className="text-sm leading-7 text-blue-950 dark:text-slate-100 [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-blue-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_img]:max-w-full"
    />
  )
}
