package checks

import (
	"go/ast"
	"go/token"
	"strings"
)

// CheckContextBackground flags context.Background() used inside business logic
// files. It is OK in main, config, and test files where there's no parent ctx.
func CheckContextBackground(path string, fset *token.FileSet, file *ast.File, res *Result) {
	if !IsBusinessLogic(path) {
		return
	}
	ast.Inspect(file, func(n ast.Node) bool {
		call, ok := n.(*ast.CallExpr)
		if !ok {
			return true
		}
		if !isSelector(call.Fun, "context", "Background") &&
			!isSelector(call.Fun, "context", "TODO") {
			return true
		}
		res.Add(Violation{
			Section:   "Prohibited Practices",
			SectionID: "28",
			Severity:  SeverityCritical,
			File:      path,
			Line:      fset.Position(call.Pos()).Line,
			Function:  funcNameAt(file, call.Pos()),
			Message:   "context.Background()/TODO() trong business logic",
			Hint:      "Dùng c.Request.Context() (handler) hoặc nhận ctx từ caller; nếu cần detach dùng context.WithoutCancel(ctx)",
		})
		return true
	})
}

// CheckPanic flags panic() calls outside main package and test files.
func CheckPanic(path string, fset *token.FileSet, file *ast.File, res *Result) {
	if IsTestFile(path) {
		return
	}
	// Allow panic in main entry / package main
	if file.Name != nil && file.Name.Name == "main" {
		return
	}
	ast.Inspect(file, func(n ast.Node) bool {
		call, ok := n.(*ast.CallExpr)
		if !ok {
			return true
		}
		ident, ok := call.Fun.(*ast.Ident)
		if !ok || ident.Name != "panic" {
			return true
		}
		res.Add(Violation{
			Section:   "Prohibited Practices",
			SectionID: "28",
			Severity:  SeverityCritical,
			File:      path,
			Line:      fset.Position(call.Pos()).Line,
			Function:  funcNameAt(file, call.Pos()),
			Message:   "panic() ngoài package main",
			Hint:      "Trả về error thay vì panic; chỉ cho phép panic ở khởi tạo trong main",
		})
		return true
	})
}

// CheckRawSQLInHandler flags string-literal SQL keywords used inside handler files.
func CheckRawSQLInHandler(path string, fset *token.FileSet, file *ast.File, res *Result) {
	if !IsHandlerFile(path) || IsTestFile(path) {
		return
	}
	ast.Inspect(file, func(n ast.Node) bool {
		lit, ok := n.(*ast.BasicLit)
		if !ok || lit.Kind != token.STRING {
			return true
		}
		upper := strings.ToUpper(lit.Value)
		// Look for SQL keywords at the start of the literal
		stripped := strings.TrimLeft(upper, "\"` \t\n")
		for _, kw := range []string{"SELECT ", "INSERT INTO", "UPDATE ", "DELETE FROM"} {
			if strings.HasPrefix(stripped, kw) {
				res.Add(Violation{
					Section:   "Prohibited Practices",
					SectionID: "28",
					Severity:  SeverityCritical,
					File:      path,
					Line:      fset.Position(lit.Pos()).Line,
					Function:  funcNameAt(file, lit.Pos()),
					Message:   "Raw SQL string trong handler: " + truncate(lit.Value, 40),
					Hint:      "Chuyển SQL vào repository layer",
				})
				return false
			}
		}
		return true
	})
}
