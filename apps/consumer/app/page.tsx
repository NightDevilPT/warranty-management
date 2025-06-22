import { Button } from "@workspace/ui/components/button"
import { ThemeSwitcher } from "@workspace/ui/components/color-change"
import { ThemeToggle } from "@workspace/ui/components/theme-toggle"

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm">Button</Button>
        <ThemeToggle />
        <ThemeSwitcher />
      </div>
    </div>
  )
}
