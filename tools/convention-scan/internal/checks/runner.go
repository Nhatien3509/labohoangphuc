package checks

import (
	"fmt"
)

// Run executes all checks against the given list of file paths.
// Paths in src/web/ are skipped (FE has its own convention).
func Run(paths []string) (*Result, []error) {
	res := &Result{}
	var errs []error

	for _, p := range paths {
		if IsExcluded(p) {
			continue
		}
		res.FilesCount++
		switch {
		case IsGoFile(p) || IsTestFile(p):
			if err := runGoChecks(p, res); err != nil {
				errs = append(errs, fmt.Errorf("%s: %w", p, err))
			}
		case IsDockerfile(p):
			CheckDockerfile(p, res)
		}
	}
	return res, errs
}

func runGoChecks(path string, res *Result) error {
	// Filename check doesn't need AST
	CheckFileName(path, res)

	fset, file, err := parseGoFile(path)
	if err != nil {
		return err
	}

	// P0 — critical (block push)
	CheckHardcodedSecret(path, fset, file, res)
	CheckContextBackground(path, fset, file, res)
	CheckPanic(path, fset, file, res)
	CheckRawSQLInHandler(path, fset, file, res)
	CheckFatHandler(path, fset, file, res)

	// P1 — warning
	CheckFunctionLength(path, fset, file, res)
	CheckBareReturnErr(path, fset, file, res)
	CheckGinH(path, fset, file, res)

	return nil
}
