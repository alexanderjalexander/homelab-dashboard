FROM node:slim
LABEL name="express-wol-backend-container"

ENV NODE_ENV production
WORKDIR /express-wol-docker
COPY . .

RUN npm install --include dev
RUN npm run build

# HEALTHCHECK --interval=10s --timeout=10s --start-period=10s --retries=3 \
#     CMD curl -fs "http://localhost:4000/api/health"

EXPOSE ${BACKEND_PORT}

CMD ["npm", "start"]
