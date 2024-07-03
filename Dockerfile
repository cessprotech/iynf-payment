###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:18-alpine As development
# Create app directory
WORKDIR /app/payment

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running yarn install on every code change.
COPY --chown=node:node package*.json yarn.lock ./

# Install app dependencies using the yarn install --immutable --immutable-cache command instead of `yarn install`
RUN yarn install --ignore-engines

# yarndle app source
COPY --chown=node:node . .

# Use the node payment from the image (instead of the root payment)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:18-alpine as build

WORKDIR /app/payment

COPY --chown=node:node package*.json yarn.lock ./

# In order to run `yarn build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `yarn install --immutable --immutable-cache` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /app/payment/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command which creates the production yarndle
RUN yarn run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running yarn install --immutable --immutable-cache --check-cache removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN yarn install --ignore-engines

USER node

###################
# PRODUCTION
###################

FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:18-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy the yarndled code from the build stage to the production image
COPY --chown=node:node package*.json yarn.lock ./

COPY --chown=node:node .env ./

COPY --chown=node:node --from=build /app/payment/node_modules ./node_modules
COPY --chown=node:node --from=build /app/payment/dist ./dist

EXPOSE 5050

CMD yarn start
