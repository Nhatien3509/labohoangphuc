package checks

import (
	"go/ast"
	"go/parser"
	"go/token"
	"os"
)

// parseGoFile returns the AST and FileSet for a Go source file.
func parseGoFile(path string) (*token.FileSet, *ast.File, error) {
	src, err := os.ReadFile(path)
	if err != nil {
		return nil, nil, err
	}
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, path, src, parser.ParseComments)
	if err != nil {
		return nil, nil, err
	}
	return fset, f, nil
}

// enclosingFunc walks up the parent chain to find the enclosing func name.
// If parents is empty, returns "".
func funcNameAt(file *ast.File, pos token.Pos) string {
	var name string
	ast.Inspect(file, func(n ast.Node) bool {
		if n == nil {
			return false
		}
		switch fn := n.(type) {
		case *ast.FuncDecl:
			if fn.Body == nil {
				return true
			}
			if pos >= fn.Pos() && pos <= fn.End() {
				if fn.Recv != nil && len(fn.Recv.List) > 0 {
					name = recvTypeName(fn.Recv.List[0].Type) + "." + fn.Name.Name
				} else {
					name = fn.Name.Name
				}
			}
		case *ast.FuncLit:
			if pos >= fn.Pos() && pos <= fn.End() && name == "" {
				name = "<closure>"
			}
		}
		return true
	})
	if name == "" {
		return "<package-level>"
	}
	return name
}

func recvTypeName(expr ast.Expr) string {
	switch t := expr.(type) {
	case *ast.StarExpr:
		return "*" + recvTypeName(t.X)
	case *ast.Ident:
		return t.Name
	}
	return "?"
}

// isSelector returns true if expr is X.Sel matching the given receiver.field names.
func isSelector(expr ast.Expr, recv, field string) bool {
	sel, ok := expr.(*ast.SelectorExpr)
	if !ok {
		return false
	}
	ident, ok := sel.X.(*ast.Ident)
	if !ok {
		return false
	}
	return ident.Name == recv && sel.Sel.Name == field
}
