import dayjs from "dayjs"
import { type Request, type Response } from "express"
import { z } from "zod"

import { focusTimeModel } from "../Models/focusTimeModel"
import { buildValidationErrorMessage } from "../Utils/build.validation.error.message"

export class FocusTimeController {
  public store = async (
    request: Request,
    response: Response,
  ): Promise<Response> => {
    const schema = z.object({
      timeFrom: z.coerce.date(), // coerse transforma a variável que vc está passando no tipo que vc estabelece aqui.
      timeTo: z.coerce.date(),
    })

    const focusTime = schema.safeParse(
      // conforme documentaçõ do Zod, precisamos usar o safeParse para trazer mensagens mais detalhadas do problema
      request.body, // não estruturamos o name, pegamos todo o request.body
    )

    if (!focusTime.success) {
      // aqui caso não seja trazido true no succcess do zod, ele manda essa mensagem de erro
      const errors = buildValidationErrorMessage(focusTime.error.issues)
      return response.status(422).json({ message: errors }) // caso de tudo certo ele continua a aplicação abaixo
    }

    const timeFrom = dayjs(focusTime.data?.timeFrom)
    const timeTo = dayjs(focusTime.data?.timeTo)

    const isTimeBeforeTimeFrom = timeTo.isBefore(timeFrom)

    if (isTimeBeforeTimeFrom) {
      return response
        .status(400)
        .json({ message: "TimeTo must be after timeFrom" })
    }

    const createdFocusTime = await focusTimeModel.create({
      timeFrom: timeFrom.toDate(),
      timeTo: timeTo.toDate(),
    })

    return response.status(201).json(createdFocusTime)
  }

  public MetricsByMonth = async (request: Request, response: Response) => {
    const schema = z.object({
      date: z.coerce.date(), // coerse transforma a variável que vc está passando no tipo que vc estabelece aqui.
    })

    const validated = schema.safeParse(request.query)

    if (!validated.success) {
      // aqui caso não seja trazido true no succcess do zod, ele manda essa mensagem de erro
      const errors = buildValidationErrorMessage(validated.error.issues)
      return response.status(422).json({ message: errors }) // caso de tudo certo ele continua a aplicação abaixo
    }

    const starDate = dayjs(validated.data.date).startOf("month")
    const endDate = dayjs(validated.data.date).endOf("month")

    const focusTimesMetrics = await focusTimeModel
      .aggregate()
      .match({
        timeFrom: {
          $gte: starDate.toDate(),
          $lte: endDate.toDate(),
        },
      })
      .project({
        Year: {
          $year: "$timeFrom",
        },
        Month: {
          $month: "$timeFrom",
        },
        Day: {
          $dayOfMonth: "$timeFrom",
        },
      })
      .group({
        _id: ["$Year", "$Month", "$Day"],
        count: {
          $sum: 1,
        },
      })
      .sort({
        // utilizado para deixar em ordem crescente. ordem dscrescente é -1.
        _id: 1,
      })
    return response.status(200).json(focusTimesMetrics)
  }
}
