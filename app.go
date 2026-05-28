package main

import (
	"context"
	"os"
	"SpectraX/scanner"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// SelectFile opens a native file dialog and returns the content of the selected file
func (a *App) SelectFile() (string, error) {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select URL List",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Text Files (*.txt)",
				Pattern:     "*.txt",
			},
		},
	})
	if err != nil {
		return "", err
	}
	if selection == "" {
		return "", nil
	}

	data, err := os.ReadFile(selection)
	if err != nil {
		return "", err
	}

	return string(data), nil
}

// StartScan starts the XSS reconnaissance
func (a *App) StartScan(urls []string, dedup bool) []scanner.ScanResult {
	payload := "rix4uni"
	var allResults []scanner.ScanResult

	finalUrls := urls
	if dedup {
		finalUrls = scanner.Uro(urls)
	}

	for i, baseURL := range finalUrls {
		// Emit progress
		runtime.EventsEmit(a.ctx, "scan-progress", i+1, len(finalUrls), baseURL)

		injected := scanner.InjectPayload(baseURL, payload)
		for _, item := range injected {
			if scanner.CheckReflectionHTML(item.URL, payload) {
				charAnalysis := scanner.AnalyzeChars(item.URL, item.Param)
				result := scanner.ScanResult{
					URL:          item.URL,
					Parameter:    item.Param,
					FoundIn:      "HTML",
					CharAnalysis: charAnalysis,
				}
				allResults = append(allResults, result)
				runtime.EventsEmit(a.ctx, "scan-result", result)
			} else if scanner.CheckReflectionDOM(item.URL, payload) {
				charAnalysis := scanner.AnalyzeChars(item.URL, item.Param)
				result := scanner.ScanResult{
					URL:          item.URL,
					Parameter:    item.Param,
					FoundIn:      "DOM",
					CharAnalysis: charAnalysis,
				}
				allResults = append(allResults, result)
				runtime.EventsEmit(a.ctx, "scan-result", result)
			}
		}
	}

	return allResults
}
