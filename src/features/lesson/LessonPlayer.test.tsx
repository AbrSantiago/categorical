// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { lessons } from "../../content/lessons";
import { ProgressProvider } from "../../progress/ProgressContext";
import { createLocalProgressRepository } from "../../progress/repository";
import { buildCatalogs } from "../../i18n/catalog";
import { SettingsProvider } from "../../settings/SettingsContext";
import { LessonPlayer } from "./LessonPage";

afterEach(cleanup);

describe("LessonPlayer", () => {
  it("checks an answer and shows feedback", async () => {
    const user = userEvent.setup();
    localStorage.setItem("categorical.settings.v1", JSON.stringify({ locale: "es", theme: "light" }));
    render(
      <SettingsProvider catalogs={buildCatalogs()}>
        <ProgressProvider repository={createLocalProgressRepository(null)}>
          <MemoryRouter>
            <LessonPlayer lesson={lessons[0]} />
          </MemoryRouter>
        </ProgressProvider>
      </SettingsProvider>,
    );

    const check = screen.getByRole("button", { name: "Comprobar" });
    expect(check).toHaveProperty("disabled", true);

    await user.click(screen.getAllByRole("radio")[0]);
    expect(check).toHaveProperty("disabled", false);
    await user.click(check);

    expect(await screen.findByRole("button", { name: "Continuar" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2 }).textContent).toMatch(/^(¡Sí, es|Era) /);
  });
});
