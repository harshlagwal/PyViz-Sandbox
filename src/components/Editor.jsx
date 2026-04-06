import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { EditorView } from '@codemirror/view';
import { undo, redo } from '@codemirror/commands';
import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';

// Custom Kinetic Shadow Theme
const kineticShadowTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#191c22',
    foreground: '#e1e2eb',
    caret: '#00d1ff',
    selection: 'rgba(0, 209, 255, 0.15)',
    selectionMatch: 'rgba(0, 209, 255, 0.25)',
    lineHighlight: 'rgba(133, 147, 153, 0.03)',
    gutterBackground: '#191c22',
    gutterForeground: '#85939940',
  },
  styles: [
    { tag: t.keyword, color: '#a4e6ff', fontWeight: 'bold' },
    { tag: t.operator, color: '#4edea3' },
    { tag: t.string, color: '#ffd59c' },
    { tag: t.number, color: '#4edea3' },
    { tag: t.comment, color: '#85939990', fontStyle: 'italic' },
    { tag: t.function(t.variableName), color: '#00d1ff' },
    { tag: t.definition(t.variableName), color: '#e1e2eb' },
    { tag: t.className, color: '#a4e6ff' },
    { tag: t.propertyName, color: '#4cd6ff' },
    { tag: t.attributeName, color: '#ffd59c' },
    { tag: t.bracket, color: '#859399' },
  ],
});

// Exposed via ref: { undo(), redo(), focus() }
const Editor = forwardRef(({ value, onChange, fontSize = 14 }, ref) => {
  const editorViewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    undo: () => {
      if (editorViewRef.current) {
        undo(editorViewRef.current);
        editorViewRef.current.focus();
      }
    },
    redo: () => {
      if (editorViewRef.current) {
        redo(editorViewRef.current);
        editorViewRef.current.focus();
      }
    },
    focus: () => {
      if (editorViewRef.current) editorViewRef.current.focus();
    },
    getValue: () => value,
  }));

  return (
    <div className="editor-container" style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CodeMirror
        value={value}
        height="100%"
        theme={kineticShadowTheme}
        extensions={[
          python(),
          EditorView.theme({
            "&": {
              fontSize: `${fontSize}px`,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              letterSpacing: "0.02em"
            },
            ".cm-gutters": {
              borderRight: "none",
              paddingLeft: "12px",
              paddingRight: "12px"
            },
            ".cm-activeLine": {
              backgroundColor: "rgba(0, 209, 255, 0.02)"
            },
            ".cm-activeLineGutter": {
              backgroundColor: "transparent",
              color: "#00d1ff"
            },
            ".cm-content": {
              padding: "24px 0",
              lineHeight: "1.8"
            },
            ".cm-line": {
              padding: "0 16px"
            },
            ".cm-selectionBackground": {
              backgroundColor: "rgba(0, 209, 255, 0.2) !important"
            }
          })
        ]}
        onChange={onChange}
        onCreateEditor={(view) => {
          editorViewRef.current = view;
        }}
        style={{ height: '100%' }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
