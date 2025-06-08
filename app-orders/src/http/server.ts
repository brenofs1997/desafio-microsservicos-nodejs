import {fastify }from 'fastify'
import { randomUUID } from 'node:crypto'
import {fastifyCors} from '@fastify/cors'
import  {z} from 'zod'
import{
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,

}from 'fastify-type-provider-zod'
import { channels } from '../broker/channels/index.ts'
import { db } from '../db/client.ts'
import { schema } from '../db/schema/index.ts'
import { dispatchOrderCreated } from '../broker/messages/order-created.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.register(fastifyCors, { origin: '*' })

app.get('/health', () =>{
    return 'OK'
})  



app.post('/orders', {
    schema: {
        body: z.object({
            amount: z.coerce.number(),  
        })
    }
}, async (request, reply) =>{
    const {amount} = request.body
    console.log('Creating an order with amount', amount)

    const orderId = randomUUID()
    dispatchOrderCreated({
        orderId,
        amount,
        customer: {
            id: 'fbe56e35-e0bc-44be-b8b1-b9408034a9d6',
        }
    })
    
try {
    
        await db.insert(schema.orders).values({
           
            id: randomUUID(),
            customerId: 'fbe56e35-e0bc-44be-b8b1-b9408034a9d6',
            amount,
            
            
        })
} catch (error) {
    console.error(error)

}
 return reply.status(201).send()
})



 app.listen({ host: '0.0.0.0', port: 3333 }).then(()=> {
    console.log('[orders] HTTP Server running!')
 })