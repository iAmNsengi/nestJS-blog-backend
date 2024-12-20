import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import jwtConfig from 'src/auth/config/jwt.config';
import { GoogleTokenDTO } from '../../dtos/google-token.dto';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';
import { MailService } from 'src/mail/providers/mail.service';
import { DataSource } from 'typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    /** Inject jwtConfiguration */
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    /** inject the generate tokens provider */
    private readonly generateTokensProvider: GenerateTokensProvider,
    /** injecting the mail service */
    private readonly mailService: MailService,
    /** injecting the datasource */
    private readonly dataSource: DataSource
  ) {}

  onModuleInit() {
    const clientId = this.jwtConfiguration.googleAuthId;
    const clientSecret = this.jwtConfiguration.googleAuthSecret;
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }
  public async authenticate(googleTokenDTO: GoogleTokenDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      // connecting to the query runner
      await queryRunner.connect();

      //verify the google token sent by user
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: googleTokenDTO.token
      });

      // extract the payload from Google JWT
      const {
        email,
        sub: googleId,
        family_name: lastName,
        given_name: firstName
      } = loginTicket.getPayload();

      // start the transaction
      await queryRunner.startTransaction();

      // Find the user in the databse using the googleId
      const user = await queryRunner.manager.findOne(User, {
        where: { googleId }
      });
      if (user) {
        return await this.generateTokensProvider.generateTokens(user);
      }

      // If not create a new user and then generate tokens
      const newUser = queryRunner.manager.create(User, {
        firstName,
        lastName,
        email,
        password: '',
        googleId
      });

      // save the user in the database
      await queryRunner.manager.save(newUser);

      // send a confirmation email to the user
      await this.mailService.sendUserWelcome(newUser);

      // generate tokens
      const tokens = await this.generateTokensProvider.generateTokens(newUser);

      // commit the transaction if everything was successul
      await queryRunner.commitTransaction();

      return tokens;
    } catch (error) {
      // if there was an error rollback
      await queryRunner.rollbackTransaction();

      // log the error
      console.log(error);

      // throw an error
      throw error;
    }
  }
}
