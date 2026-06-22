package checks

import (
	"go/ast"
	"go/token"
)

// CheckFatHandler flags handler functions that contain business orchestration
// patterns: DB calls (gorm.*), raw HTTP client calls (http.*, client.*), or
// loops with multiple side-effecting calls inside.
//
// Heuristic: a handler func is "fat" if it is in a handler/ path AND its body
// has either > 30 statements OR a forbidden call (gorm/db/http client).
func CheckFatHandler(path string, fset *token.FileSet, file *ast.File, res *Result) {
	if !IsHandlerFile(path) {
		return
	}
	ast.Inspect(file, func(n ast.Node) bool {
		fn, ok := n.(*ast.FuncDecl)
		if !ok || fn.Body == nil {
			return true
		}
		bodyLines := fset.Position(fn.Body.Rbrace).Line - fset.Position(fn.Body.Lbrace).Line
		hasForbidden, forbidden := bodyHasForbiddenCall(fn.Body)
		// Long handler OR forbidden infra call → fat
		if bodyLines > 30 || hasForbidden {
			msg := "Handler chứa quá nhiều logic"
			if hasForbidden {
				msg = "Handler gọi trực tiếp " + forbidden + " — phải đi qua service/repository"
			}
			res.Add(Violation{
				Section:   "Nguyên tắc kiến trúc",
				SectionID: "2",
				Severity:  SeverityCritical,
				File:      path,
				Line:      fset.Position(fn.Pos()).Line,
				Function:  funcNameFromDecl(fn),
				Message:   msg,
				Hint:      "Chuyển business logic vào service layer; handler chỉ parse request + gọi service",
			})
		}
		return true
	})
}

func bodyHasForbiddenCall(body *ast.BlockStmt) (bool, string) {
	var hit string
	ast.Inspect(body, func(n ast.Node) bool {
		call, ok := n.(*ast.CallExpr)
		if !ok {
			return true
		}
		sel, ok := call.Fun.(*ast.SelectorExpr)
		if !ok {
			return true
		}
		ident, ok := sel.X.(*ast.Ident)
		if !ok {
			return true
		}
		switch ident.Name {
		case "gorm", "db", "tx", "sql":
			hit = ident.Name + "." + sel.Sel.Name + "()"
			return false
		case "http":
			// http.Get / http.Post / http.Do etc — direct HTTP from handler
			switch sel.Sel.Name {
			case "Get", "Post", "Put", "Delete", "Do", "NewRequest":
				hit = "http." + sel.Sel.Name + "()"
				return false
			}
		}
		return true
	})
	return hit != "", hit
}

func funcNameFromDecl(fn *ast.FuncDecl) string {
	if fn.Recv != nil && len(fn.Recv.List) > 0 {
		return recvTypeName(fn.Recv.List[0].Type) + "." + fn.Name.Name
	}
	return fn.Name.Name
}
