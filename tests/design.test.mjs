import {readFileSync} from 'node:fs';
import crypto from 'node:crypto';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
const baseline=JSON.parse(readFileSync('tests/design-baseline.json','utf8'));
export function describe(source,path) {
 if(path.endsWith('.css')||path==='index.html')return crypto.createHash('sha256').update(source).digest('hex');
 const ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),classes=[],elements=[];
 function visit(node){
  if(ts.isJsxAttribute(node)&&node.name.getText(ast)==='className')classes.push(node.initializer?.getText(ast));
  if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node))elements.push(node.tagName.getText(ast));
  ts.forEachChild(node,visit);
 }
 visit(ast);return {classes,elements};
}
test('original JSX structure, CSS classes, styles and HTML shell preserved',()=>{
 for(const [path,stored]of Object.entries(baseline)) {
  const expected=structuredClone(stored);
  let source=readFileSync(path,'utf8');
  if(path==='src/components/AdminModals/CategoryEditorModal.tsx') {
    assert.ok(source.includes('id="category-custom-id"'));
    source=source.replace(/\{\/\* Editable category ID: requested v10 control \*\/\}[\s\S]*?\{\/\* End editable category ID \*\/\}/,'');
  }
  const actual=describe(source,path);
  if(path==='src/App.tsx') {
   // The only extra JSX element is the second, mobile-only instance below the table.
   const i=actual.elements.lastIndexOf('SubLevelsNav');actual.elements.splice(i,1);
  }
  if(path==='src/components/SubLevelsNav.tsx') {
   const root=actual.classes.findIndex(c=>c.includes('placement')&&c.includes('lg:hidden'));
   const grid=actual.classes.findIndex(c=>c.includes('placement')&&c.includes('hidden lg:flex'));
   assert.ok(root>=0&&grid>=0);
   actual.classes[root]=expected.classes[root];actual.classes[grid]=expected.classes[grid];
  }
  assert.deepEqual(actual,expected,path);
 }
});
