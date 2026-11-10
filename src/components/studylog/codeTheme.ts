import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

// 노션의 코드 블록처럼: 번호 없이, 고정폭 글꼴(85%), 은은한 문법 색. 배경은 CSS(.milkdown-code-block)에서 정한다.
const highlight = HighlightStyle.define([
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: '#708090' },
  { tag: [t.punctuation, t.bracket, t.separator], color: '#999999' },
  { tag: [t.propertyName, t.tagName, t.bool, t.number, t.atom, t.deleted], color: '#990055' },
  { tag: [t.string, t.character, t.attributeValue, t.inserted, t.special(t.string)], color: '#669900' },
  { tag: [t.operator, t.url], color: '#9a6e3a' },
  { tag: [t.keyword, t.attributeName, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: '#0077aa' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.className, t.typeName], color: '#dd4a68' },
  { tag: t.regexp, color: '#ee9900' },
])

const layout = EditorView.theme({
  '&': { backgroundColor: 'transparent', fontSize: '85%' },
  '.cm-scroller': { fontFamily: "SFMono-Regular, Menlo, Consolas, 'PT Mono', 'Liberation Mono', Courier, monospace", lineHeight: '1.6' },
  '.cm-content': { padding: '0' },
  '.cm-activeLine': { backgroundColor: 'transparent' },
})

export const notionCodeTheme = [layout, syntaxHighlighting(highlight)]
