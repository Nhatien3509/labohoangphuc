package checks

import (
	"path/filepath"
	"strings"
)

// CheckFileName flags Go file names that use kebab-case instead of snake_case.
func CheckFileName(path string, res *Result) {
	if !strings.HasSuffix(path, ".go") {
		return
	}
	base := filepath.Base(path)
	if !strings.Contains(base, "-") {
		return
	}
	// Suggest the snake_case form
	suggestion := strings.ReplaceAll(base, "-", "_")
	res.Add(Violation{
		Section:   "Naming Convention",
		SectionID: "4.3",
		Severity:  SeverityWarning,
		File:      path,
		Line:      1,
		Function:  "<file>",
		Message:   "Go file name dùng kebab-case: " + base,
		Hint:      "Đổi thành snake_case: " + suggestion,
	})
}
