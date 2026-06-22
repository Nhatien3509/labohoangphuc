package checks

import (
	"path/filepath"
	"strings"
)

func normalize(path string) string {
	return filepath.ToSlash(path)
}

// IsExcluded returns true if the file is outside the Go convention scope
// (e.g. src/web/ is the Next.js SPA — has its own FE conventions).
func IsExcluded(path string) bool {
	p := normalize(path)
	return strings.Contains(p, "/src/web/") || strings.HasPrefix(p, "src/web/")
}

func IsGoFile(path string) bool {
	return strings.HasSuffix(path, ".go") && !strings.HasSuffix(path, "_test.go")
}

func IsTestFile(path string) bool {
	return strings.HasSuffix(path, "_test.go")
}

func IsHandlerFile(path string) bool {
	p := normalize(path)
	return strings.Contains(p, "/handler/") || strings.Contains(p, "/handlers/")
}

func IsServiceFile(path string) bool {
	p := normalize(path)
	return strings.Contains(p, "/service/") || strings.Contains(p, "/services/")
}

func IsRepositoryFile(path string) bool {
	p := normalize(path)
	return strings.Contains(p, "/repository/") || strings.Contains(p, "/repo/")
}

func IsConfigFile(path string) bool {
	p := normalize(path)
	return strings.Contains(p, "/config/") || strings.HasSuffix(p, "/config.go")
}

func IsMainFile(path string) bool {
	p := normalize(path)
	return strings.HasSuffix(p, "/cmd/server/main.go") || strings.HasSuffix(p, "/main.go")
}

// IsBusinessLogic returns true if the file contains business logic and
// therefore should not use context.Background() or panic().
func IsBusinessLogic(path string) bool {
	if IsMainFile(path) || IsConfigFile(path) || IsTestFile(path) {
		return false
	}
	p := normalize(path)
	return IsHandlerFile(path) ||
		IsServiceFile(path) ||
		IsRepositoryFile(path) ||
		strings.Contains(p, "/core/") ||
		strings.Contains(p, "/provider/") ||
		strings.Contains(p, "/pipeline/") ||
		strings.Contains(p, "/usecase/")
}

func IsDockerfile(path string) bool {
	base := filepath.Base(path)
	return base == "Dockerfile" || strings.HasPrefix(base, "Dockerfile.")
}

func IsGoMod(path string) bool {
	return filepath.Base(path) == "go.mod"
}
