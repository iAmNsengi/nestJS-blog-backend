import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query
} from '@nestjs/common';
import { UsersService } from './providers/users.services';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from './dtos/create-user.dto';
import RegexCraft from 'regexcraft';
import { create } from 'domain';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  public getAllUsers() {
    return this.userService.findAll();
  }

  @Get('/:id?')
  @ApiOperation({
    summary: 'Get one user by id'
  })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully'
  })
  public findOneById(
    @Param('id', ParseIntPipe)
    id: number
  ) {
    return this.userService.findOneById(id);
  }

  @Post('')
  @ApiOperation({ description: 'Create a new User' })
  @ApiResponse({ status: 200, description: 'User created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request, data provided has issues'
  })
  @ApiResponse({ status: 500, description: 'An internal server error occured' })
  public createUser(@Body() createUserDTO: CreateUserDTO) {
    return this.userService.createUser(createUserDTO);
  }

  @Post('/create-many')
  @ApiOperation({ description: 'Create many users' })
  public createManyUsers(@Body() createUsersDTO: CreateUserDTO[]) {
    return this.userService.createMany(createUsersDTO);
  }
}
