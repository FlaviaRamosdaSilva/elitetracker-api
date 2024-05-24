/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Router } from "express"

import packageJson from "../package.json"
import { HabitsController } from "./Controllers/habitsController"

export const routes = Router()
const habitsController = new HabitsController()

routes.get("/", (request, response) => {
  const { name, description, version } = packageJson
  return response.status(200).json({ name, description, version })
})

routes.post("/habits", habitsController.store) // virgula o controller que tem a rota de post configurada ponto store exemplo: habitsController.store
routes.get("/habits", habitsController.index) // aqui vamos listar todos os hábitos
