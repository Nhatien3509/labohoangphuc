package checks

import (
	"go/ast"
	"go/token"
	"regexp"
	"strings"
)

var secretKeyPattern = regexp.MustCompile(`(?i)(pass|secret|token|api[-_]?key|priv[-_]?key|access[-_]?key)`)

// CheckHardcodedSecret flags viper.SetDefault calls (and similar) where a
// secret-looking key gets a non-empty default that isn't an env-var reference.
//
// Example violation: viper.SetDefault("DB_PASS", "secret")
func CheckHardcodedSecret(path string, fset *token.FileSet, file *ast.File, res *Result) {
	if IsTestFile(path) {
		return
	}
	ast.Inspect(file, func(n ast.Node) bool {
		call, ok := n.(*ast.CallExpr)
		if !ok || len(call.Args) < 2 {
			return true
		}
		// Match viper.SetDefault / os.Setenv / similar 2-arg key/value calls
		sel, ok := call.Fun.(*ast.SelectorExpr)
		if !ok {
			return true
		}
		ident, ok := sel.X.(*ast.Ident)
		if !ok {
			return true
		}
		if !((ident.Name == "viper" && sel.Sel.Name == "SetDefault") ||
			(ident.Name == "os" && sel.Sel.Name == "Setenv")) {
			return true
		}
		key, keyOK := stringLit(call.Args[0])
		val, valOK := stringLit(call.Args[1])
		if !keyOK || !valOK {
			return true
		}
		if !secretKeyPattern.MatchString(key) {
			return true
		}
		trimmed := strings.TrimSpace(val)
		if trimmed == "" || strings.HasPrefix(trimmed, "$") {
			return true
		}
		res.Add(Violation{
			Section:   "Security Convention",
			SectionID: "13",
			Severity:  SeverityCritical,
			File:      path,
			Line:      fset.Position(call.Pos()).Line,
			Function:  funcNameAt(file, call.Pos()),
			Message:   "Hardcoded secret: " + ident.Name + "." + sel.Sel.Name + `("` + key + `", "` + truncate(val, 20) + `")`,
			Hint:      "Bỏ default, yêu cầu env var bắt buộc hoặc dùng Vault",
		})
		return true
	})
}

func stringLit(expr ast.Expr) (string, bool) {
	lit, ok := expr.(*ast.BasicLit)
	if !ok || lit.Kind != token.STRING {
		return "", false
	}
	// Strip surrounding quotes
	s := lit.Value
	if len(s) >= 2 && (s[0] == '"' || s[0] == '`') {
		s = s[1 : len(s)-1]
	}
	return s, true
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}
