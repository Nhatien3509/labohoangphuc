package checks

import (
	"bufio"
	"os"
	"strings"
)

// CheckDockerfile flags Dockerfiles missing USER or HEALTHCHECK directives.
func CheckDockerfile(path string, res *Result) {
	if !IsDockerfile(path) {
		return
	}
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()

	hasUser, hasHealthcheck := false, false
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		upper := strings.ToUpper(line)
		if strings.HasPrefix(upper, "USER ") {
			hasUser = true
		}
		if strings.HasPrefix(upper, "HEALTHCHECK ") {
			hasHealthcheck = true
		}
	}

	if !hasUser {
		res.Add(Violation{
			Section:   "Docker Convention",
			SectionID: "20",
			Severity:  SeverityWarning,
			File:      path,
			Line:      1,
			Function:  "<dockerfile>",
			Message:   "Dockerfile thiếu USER directive (chạy bằng root)",
			Hint:      `Thêm: RUN addgroup -S app && adduser -S app -G app  /  USER app`,
		})
	}
	if !hasHealthcheck {
		res.Add(Violation{
			Section:   "Docker Convention",
			SectionID: "20",
			Severity:  SeverityWarning,
			File:      path,
			Line:      1,
			Function:  "<dockerfile>",
			Message:   "Dockerfile thiếu HEALTHCHECK directive",
			Hint:      `HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1`,
		})
	}
}
