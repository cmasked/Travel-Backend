import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { buildSwaggerConfig } from './swagger.config';
import { SWAGGER_API_ROOT } from './swagger.constants';

import { MANDATORY_HEADERS } from '../shared/constants/mandatory-headers.constant';

export const setupSwagger = (app: INestApplication): void => {
  const config = buildSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config);

  const customJsStr = `
    const validationRules = ${JSON.stringify(MANDATORY_HEADERS.map(h => ({ name: h.name, msg: h.errorMessage })))};
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const errorNodes = node.querySelectorAll ? Array.from(node.querySelectorAll('li')) : [];
            if (node.tagName === 'LI') errorNodes.push(node);
            errorNodes.forEach((li) => {
              if (li.innerText.includes('Value must follow pattern') || li.innerText.includes('Value must be no longer than') || li.innerText.includes('Value must be no less than')) {
                validationRules.forEach(rule => {
                  if (li.innerText.includes("For '" + rule.name + "':")) {
                    li.innerText = "For '" + rule.name + "': " + rule.msg;
                  }
                });
              }
            });
          }
        });
      });
    });
    window.addEventListener('load', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  `;

  SwaggerModule.setup(SWAGGER_API_ROOT, app, document, {
    customJsStr,
  });
};
