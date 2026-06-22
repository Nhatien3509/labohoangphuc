package checks

import (
	"go/ast"
	"go/token"
)

// CheckBareReturnErr flags `return err` statements that don't wrap with context.
// Allowed locations: test files, files inside repository/ (pure DB pass-through).
func CheckBareReturnErr(path string, fset *token.FileSet, file *ast.File, res *Result) {
	if IsTestFile(path) {
		return
	}
	ast.Inspect(file, func(n ast.Node) bool {
		ret, ok := n.(*ast.ReturnStmt)
		if !ok {
			return true
		}
		// Find an `err` ident among the return values
		for _, expr := range ret.Results {
			ident, ok := expr.(*ast.Ident)
			if !ok || ident.Name != "err" {
				continue
			}
			// Single bare return of err, or last value being err with others nil/zero
			res.Add(Violation{
				Section:   "Error Handling",
				SectionID: "8",
				Severity:  SeverityWarning,
				File:      path,
				Line:      fset.Position(ret.Pos()).Line,
				Function:  funcNameAt(file, ret.Pos()),
				Message:   "Bare `return err` không wrap context",
				Hint:      `Dùng fmt.Errorf("...: %w", err) hoặc errors.Wrap(err, "context")`,
			})
			return true
		}
		return true
	})
}
