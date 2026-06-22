package checks

import (
	"fmt"
	"go/ast"
	"go/token"
)

const maxFuncLines = 50

// CheckFunctionLength flags functions whose body is longer than maxFuncLines.
func CheckFunctionLength(path string, fset *token.FileSet, file *ast.File, res *Result) {
	ast.Inspect(file, func(n ast.Node) bool {
		fn, ok := n.(*ast.FuncDecl)
		if !ok || fn.Body == nil {
			return true
		}
		start := fset.Position(fn.Body.Lbrace).Line
		end := fset.Position(fn.Body.Rbrace).Line
		bodyLines := end - start - 1
		if bodyLines <= maxFuncLines {
			return true
		}
		res.Add(Violation{
			Section:   "Clean Code Rules",
			SectionID: "7",
			Severity:  SeverityWarning,
			File:      path,
			Line:      fset.Position(fn.Pos()).Line,
			Function:  funcNameFromDecl(fn),
			Message:   fmt.Sprintf("Function dài %d dòng (giới hạn %d)", bodyLines, maxFuncLines),
			Hint:      "Tách function thành các step nhỏ, mỗi function < 50 dòng",
		})
		return true
	})
}
