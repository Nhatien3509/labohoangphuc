package checks

import (
	"go/ast"
	"go/token"
)

// CheckGinH flags direct use of gin.H{} composite literals.
// Handlers should return responses through pkg/httputil/response.go (standard envelope).
func CheckGinH(path string, fset *token.FileSet, file *ast.File, res *Result) {
	if IsTestFile(path) {
		return
	}
	ast.Inspect(file, func(n ast.Node) bool {
		lit, ok := n.(*ast.CompositeLit)
		if !ok || lit.Type == nil {
			return true
		}
		sel, ok := lit.Type.(*ast.SelectorExpr)
		if !ok {
			return true
		}
		ident, ok := sel.X.(*ast.Ident)
		if !ok {
			return true
		}
		if ident.Name != "gin" || sel.Sel.Name != "H" {
			return true
		}
		res.Add(Violation{
			Section:   "HTTP API Convention",
			SectionID: "10",
			Severity:  SeverityWarning,
			File:      path,
			Line:      fset.Position(lit.Pos()).Line,
			Function:  funcNameAt(file, lit.Pos()),
			Message:   "Dùng gin.H{} trực tiếp",
			Hint:      "Dùng pkg/httputil/response.go (standard envelope: code/message/data)",
		})
		return true
	})
}
