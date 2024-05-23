import { Schema, model } from "mongoose"

const habitSchema = new Schema(
  {
    name: {
      type: String,
      required: true, // obrigatório
    },
    completedDates: {
      // essa propriedade tem um nome "inventado"
      type: [Date], // é um array de datas; colocamos ele para saber toda vez que ele for completar uma atividade/habito // quando o usuário marcar lá no item completo,
      // ele vai gravar a data que o usuário fez isso.
    },
  },
  {
    versionKey: false, // versionamento de documento que o Mongoose utiliza e nós não precisamos
    timestamps: true, // ele faz o createdAt e updatedAt automaticamente com esse tru
  },
)

export const habitModel = model("Habit", habitSchema)
